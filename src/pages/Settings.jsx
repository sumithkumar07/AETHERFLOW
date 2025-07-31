import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  KeyIcon,
  PaintBrushIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, isAuthenticated } = useAuthStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    company: user?.company || ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    projectUpdates: true,
    marketingEmails: false,
    securityAlerts: true,
    weeklyDigest: true
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'appearance', name: 'Appearance', icon: PaintBrushIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'api', name: 'API Keys', icon: KeyIcon }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password updated successfully!')
    } catch (error) {
      toast.error('Failed to update password')
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationToggle = (key) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    toast.success('Notification preferences updated')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CogIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Settings</h3>
          <p className="text-gray-600 mb-4">Please login to access your account settings</p>
          <a href="/login" className="btn-primary">
            Login to Continue
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">Manage your account preferences and security settings</p>
        </div>

        <div className="lg:flex lg:space-x-8">
          {/* Sidebar */}
          <div className="lg:w-64 mb-8 lg:mb-0">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white shadow-sm rounded-lg">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                  
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                        {profileData.avatar ? (
                          <img src={profileData.avatar} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                          <UserCircleIcon className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <button type="button" className="btn-secondary text-sm">
                          Change Avatar
                        </button>
                        <p className="text-xs text-gray-500 mt-1">JPG, GIF or PNG. Max size 2MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          className="input-field"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          className="input-field"
                          placeholder="Enter your email"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company
                        </label>
                        <input
                          type="text"
                          value={profileData.company}
                          onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                          className="input-field"
                          placeholder="Your company name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          className="input-field"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                        className="input-field"
                        placeholder="https://your-website.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        rows={4}
                        className="input-field resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center space-x-2"
                      >
                        {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
                  
                  <div className="space-y-6">
                    {Object.entries(notificationSettings).map(([key, value]) => {
                      const labels = {
                        emailNotifications: { title: 'Email Notifications', description: 'Receive notifications via email' },
                        pushNotifications: { title: 'Push Notifications', description: 'Receive push notifications in browser' },
                        projectUpdates: { title: 'Project Updates', description: 'Get notified about project changes' },
                        marketingEmails: { title: 'Marketing Emails', description: 'Receive product updates and tips' },
                        securityAlerts: { title: 'Security Alerts', description: 'Important security notifications' },
                        weeklyDigest: { title: 'Weekly Digest', description: 'Weekly summary of your activity' }
                      }
                      
                      return (
                        <div key={key} className="flex items-center justify-between py-3">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {labels[key].title}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {labels[key].description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleNotificationToggle(key)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              value ? 'bg-primary-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                value ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>
                  
                  <div className="space-y-8">
                    {/* Change Password */}
                    <div>
                      <h3 className="text-md font-medium text-gray-900 mb-4">Change Password</h3>
                      <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                              className="input-field pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPassword ? (
                                <EyeSlashIcon className="w-5 h-5 text-gray-400" />
                              ) : (
                                <EyeIcon className="w-5 h-5 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            className="input-field"
                            placeholder="Enter new password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            className="input-field"
                            placeholder="Confirm new password"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center space-x-2"
                          >
                            {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                            <span>Update Password</span>
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="border-t pt-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-md font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <button className="btn-secondary">
                          Enable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="border-t pt-8">
                      <h3 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <DevicePhoneMobileIcon className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">Current Session</p>
                              <p className="text-xs text-gray-500">Chrome on macOS • New York, NY</p>
                            </div>
                          </div>
                          <span className="text-xs text-green-600 font-medium">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Appearance & Language</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Theme Preference
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {['light', 'dark', 'system'].map((theme) => (
                          <button
                            key={theme}
                            onClick={() => setAppearanceSettings({...appearanceSettings, theme})}
                            className={`p-3 border rounded-lg text-sm font-medium capitalize transition-colors ${
                              appearanceSettings.theme === theme
                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                : 'border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {theme}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Language
                      </label>
                      <select
                        value={appearanceSettings.language}
                        onChange={(e) => setAppearanceSettings({...appearanceSettings, language: e.target.value})}
                        className="input-field"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={appearanceSettings.timezone}
                        onChange={(e) => setAppearanceSettings({...appearanceSettings, timezone: e.target.value})}
                        className="input-field"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="America/Chicago">Central Time</option>
                        <option value="America/Denver">Mountain Time</option>
                        <option value="America/Los_Angeles">Pacific Time</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">Billing & Subscription</h2>
                  
                  <div className="text-center py-12">
                    <CreditCardIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Free Plan</h3>
                    <p className="text-gray-600 mb-6">
                      You're currently on the free plan with unlimited AI access via Puter.js
                    </p>
                    <button className="btn-primary">
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              )}

              {/* API Keys Tab */}
              {activeTab === 'api' && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">API Keys</h2>
                  
                  <div className="text-center py-12">
                    <KeyIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">API Access</h3>
                    <p className="text-gray-600 mb-6">
                      Generate API keys to integrate AI Code Studio with your applications
                    </p>
                    <button className="btn-primary">
                      Generate API Key
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings