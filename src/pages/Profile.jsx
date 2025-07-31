import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserCircleIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  MoonIcon,
  SunIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'preferences', name: 'Preferences', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ]

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await updateUser(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  return (
    <div className="min-h-screen pt-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserCircleIcon className="w-12 h-12 text-white" />
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user?.name || 'Your Profile'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account settings and preferences
            </p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6"
        >
          {activeTab === 'profile' && (
            <ProfileTab 
              formData={formData} 
              setFormData={setFormData} 
              onSave={handleSave} 
            />
          )}
          {activeTab === 'preferences' && (
            <PreferencesTab theme={theme} toggleTheme={toggleTheme} />
          )}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'security' && <SecurityTab />}
        </motion.div>
      </div>
    </div>
  )
}

// Profile Tab Component
const ProfileTab = ({ formData, setFormData, onSave }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
    <form onSubmit={onSave} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="Enter your email"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({...formData, bio: e.target.value})}
          rows="4"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200 resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="Your location"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => setFormData({...formData, website: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
            placeholder="https://your-website.com"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Save Changes
        </button>
      </div>
    </form>
  </div>
)

// Preferences Tab Component
const PreferencesTab = ({ theme, toggleTheme }) => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Preferences</h2>
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
        <div className="flex items-center space-x-3">
          {theme === 'dark' ? (
            <MoonIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          ) : (
            <SunIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Theme</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred theme
            </p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
        <div className="flex items-center space-x-3">
          <DevicePhoneMobileIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Mobile Sync</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sync your projects across devices
            </p>
          </div>
        </div>
        <button
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors duration-200"
        >
          <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform duration-200" />
        </button>
      </div>

      <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
        <div className="flex items-center space-x-3">
          <ComputerDesktopIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Auto-save</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Automatically save your work
            </p>
          </div>
        </div>
        <button
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors duration-200"
        >
          <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition-transform duration-200" />
        </button>
      </div>
    </div>
  </div>
)

// Notifications Tab Component
const NotificationsTab = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Notifications</h2>
    <p className="text-gray-600 dark:text-gray-400">Notification settings coming soon...</p>
  </div>
)

// Security Tab Component
const SecurityTab = () => (
  <div>
    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Security</h2>
    <div className="space-y-6">
      <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl">
        <div className="flex items-center space-x-3 mb-4">
          <KeyIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Change Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Update your password to keep your account secure
            </p>
          </div>
        </div>
        <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200">
          Change Password
        </button>
      </div>
    </div>
  </div>
)

export default Profile