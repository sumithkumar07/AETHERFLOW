import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CommandLineIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  UserIcon,
  LockClosedIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import LoadingStates from '../components/LoadingStates'

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { 
    login, 
    demoLogin, 
    isLoading, 
    error, 
    clearError, 
    isAuthenticated,
    isRateLimited,
    getRateLimitTime 
  } = useAuthStore()

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [rateLimitTime, setRateLimitTime] = useState(0)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/chat'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  // Handle rate limiting
  useEffect(() => {
    if (isRateLimited()) {
      setRateLimitTime(getRateLimitTime())
      const timer = setInterval(() => {
        const time = getRateLimitTime()
        setRateLimitTime(time)
        if (time <= 0) {
          clearInterval(timer)
        }
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [isRateLimited, getRateLimitTime])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    // Validation
    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields')
      return
    }

    if (isRateLimited()) {
      setLocalError(`Too many login attempts. Please wait ${rateLimitTime} seconds.`)
      return
    }

    try {
      const result = await login(formData)
      if (result.success) {
        const from = location.state?.from?.pathname || '/chat'
        navigate(from, { replace: true })
      }
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleDemoLogin = async () => {
    clearError()
    setLocalError('')
    
    try {
      const result = await demoLogin()
      if (result.success) {
        const from = location.state?.from?.pathname || '/chat'
        navigate(from, { replace: true })
      }
    } catch (error) {
      // Error is handled by the store
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (localError || error) {
      setLocalError('')
      clearError()
    }
  }

  const displayError = localError || error
  const isButtonDisabled = isLoading || isRateLimited()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl"
            >
              <CommandLineIcon className="h-8 w-8 text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 text-3xl font-bold text-gray-900 dark:text-white"
            >
              Welcome back to 
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Aether AI
              </span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-2 text-sm text-gray-600 dark:text-gray-400"
            >
              Sign in to continue your AI development journey
            </motion.p>

            {/* 2025 Features Preview */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-6 grid grid-cols-3 gap-2"
            >
              <div className="flex items-center justify-center px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <SparklesIcon className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Voice AI</span>
              </div>
              <div className="flex items-center justify-center px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <CpuChipIcon className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">2025 Models</span>
              </div>
              <div className="flex items-center justify-center px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <CommandLineIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Real-time</span>
              </div>
            </motion.div>
          </div>

          {/* Error Display */}
          {displayError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  {displayError}
                </span>
              </div>
            </motion.div>
          )}

          {/* Rate Limit Warning */}
          {isRateLimited() && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4"
            >
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-sm text-yellow-800 dark:text-yellow-200">
                  Too many login attempts. Please wait {rateLimitTime} seconds before trying again.
                </span>
              </div>
            </motion.div>
          )}

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 space-y-6"
            onSubmit={handleSubmit}
          >
            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="relative block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Email address"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="relative block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isButtonDisabled}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingStates.LoadingSpinner size="sm" color="white" />
                    <span className="ml-2">Signing in to Aether AI...</span>
                  </div>
                ) : (
                  'Sign in to Aether AI'
                )}
              </button>
            </div>

            {/* Demo Login Button */}
            <div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isButtonDisabled}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingStates.LoadingSpinner size="sm" color="current" />
                    <span className="ml-2">Loading demo...</span>
                  </div>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Try Aether AI Demo
                  </>
                )}
              </button>
            </div>
          </motion.form>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center space-y-4"
          >
            <div>
              <Link
                to="/signup"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Don't have an account? Sign up for Aether AI
              </Link>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to experience the future of AI development
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login