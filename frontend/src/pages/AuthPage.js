import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import {
  User, Mail, Lock, Eye, EyeOff, ArrowRight, 
  Sparkles, Shield, CheckCircle, Github, Globe
} from 'lucide-react';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { login } = useAuth();
  const [isSignUp, setIsSignUp] = useState(location.pathname === '/auth/signup');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });

  React.useEffect(() => {
    setIsSignUp(location.pathname === '/auth/signup');
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Demo credentials for quick access
      if (formData.email === 'demo@aetherflow.dev' || formData.email === '') {
        await login('demo@aetherflow.dev', 'cosmicpower2025');
        navigate('/app');
      } else {
        // Handle real authentication here
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/app');
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "AI-powered code generation and optimization",
    "Real-time collaboration with team members", 
    "One-click deployment to multiple platforms",
    "Advanced debugging and performance analysis",
    "Integrated project management tools"
  ];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Left Panel - Features Showcase */}
      <div className={`hidden lg:flex lg:w-1/2 ${theme === 'dark' ? 'bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600'} p-12 flex-col justify-center`}>
        <div className="max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">AETHERFLOW</h1>
          </div>
          
          <h2 className="text-4xl font-bold text-white mb-6">
            {isSignUp ? 'Join the Future of' : 'Welcome Back to'} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              Professional Development
            </span>
          </h2>
          
          <p className="text-xl text-blue-100 mb-8">
            Experience the next generation of collaborative development with AI-powered tools, 
            real-time collaboration, and professional-grade deployment solutions.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <span className="text-blue-100">{feature}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-green-400" />
              <span className="text-white font-semibold">Demo Access Available</span>
            </div>
            <p className="text-sm text-blue-100">
              <strong>Email:</strong> demo@aetherflow.dev<br />
              <strong>Password:</strong> cosmicpower2025
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className={`w-10 h-10 ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} rounded-xl flex items-center justify-center`}>
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                AETHERFLOW
              </h1>
            </div>
            
            <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              {isSignUp ? 'Create Your Account' : 'Sign In to Your Reality'}
            </h2>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {isSignUp 
                ? 'Join thousands of developers building the future'
                : 'Welcome back! Enter your credentials to continue'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className={`w-full px-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3.5 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="demo@aetherflow.dev"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className={`w-full pl-10 pr-12 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="cosmicpower2025"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3.5 ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-3.5 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${theme === 'dark' ? 'bg-gray-900 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className={`flex items-center justify-center px-4 py-3 border ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors`}>
                <Github className="w-5 h-5" />
              </button>
              <button className={`flex items-center justify-center px-4 py-3 border ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-300 hover:bg-gray-50'} rounded-lg transition-colors`}>
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;