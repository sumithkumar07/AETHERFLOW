import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, Eye, EyeOff, Mail, Lock, User, ArrowRight, 
  AlertCircle, CheckCircle, Github, Chrome, Check, Sparkles 
} from 'lucide-react';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    receiveUpdates: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSocialSignup = (provider) => {
    console.log(`Social signup with ${provider}`);
    // TODO: Implement social signup
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: return { text: '', color: '' };
      case 1: return { text: 'Very Weak', color: 'text-red-400' };
      case 2: return { text: 'Weak', color: 'text-orange-400' };
      case 3: return { text: 'Medium', color: 'text-yellow-400' };
      case 4: return { text: 'Strong', color: 'text-blue-400' };
      case 5: return { text: 'Very Strong', color: 'text-green-400' };
      default: return { text: '', color: '' };
    }
  };

  const getPasswordStrengthWidth = () => {
    return `${(passwordStrength / 5) * 100}%`;
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 py-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <Zap className="w-8 h-8 text-blue-400" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AETHERFLOW
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Join the Cosmic Revolution</h1>
          <p className="text-gray-400">Create your account and start coding across multiple realities</p>
        </div>

        {/* Sign Up Form */}
        <div className="glass-surface p-8 rounded-2xl border border-slate-600">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center text-red-400">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Your cosmic name"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Create a strong password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                    <span>Password strength</span>
                    <span className={strengthInfo.color}>{strengthInfo.text}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength <= 2 ? 'bg-red-400' : 
                        passwordStrength <= 3 ? 'bg-yellow-400' : 
                        passwordStrength <= 4 ? 'bg-blue-400' : 'bg-green-400'
                      }`}
                      style={{ width: getPasswordStrengthWidth() }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <CheckCircle className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-400 w-5 h-5" />
                )}
              </div>
            </div>

            {/* Terms and Updates */}
            <div className="space-y-3">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                  required
                />
                <span className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <label className="flex items-start">
                <input
                  type="checkbox"
                  name="receiveUpdates"
                  checked={formData.receiveUpdates}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-500 bg-slate-700 border-slate-600 rounded focus:ring-blue-500 focus:ring-2 mt-0.5"
                />
                <span className="ml-2 text-sm text-gray-300">
                  Send me cosmic updates and feature announcements
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading || passwordStrength < 3}
              className="btn btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Cosmic Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-slate-600"></div>
            <span className="px-4 text-sm text-gray-400">Or sign up with</span>
            <div className="flex-1 h-px bg-slate-600"></div>
          </div>

          {/* Social Signup */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialSignup('google')}
              className="btn btn-secondary justify-center"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </button>
            <button
              onClick={() => handleSocialSignup('github')}
              className="btn btn-secondary justify-center"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-blue-400 hover:text-blue-300 font-semibold"
              >
                Sign in to your reality
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-600">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4 text-purple-400 mr-2" />
            <span className="text-sm font-medium text-purple-300">What You Get</span>
          </div>
          <ul className="text-xs text-gray-400 space-y-1">
            <li className="flex items-center"><Check className="w-3 h-3 text-green-400 mr-2" /> 500 free VIBE tokens</li>
            <li className="flex items-center"><Check className="w-3 h-3 text-green-400 mr-2" /> Access to 1 parallel universe</li>
            <li className="flex items-center"><Check className="w-3 h-3 text-green-400 mr-2" /> AI-powered coding assistance</li>
            <li className="flex items-center"><Check className="w-3 h-3 text-green-400 mr-2" /> Sacred geometry UI</li>
          </ul>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link 
            to="/" 
            className="text-gray-400 hover:text-white text-sm inline-flex items-center"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;