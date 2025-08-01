import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  Cog6ToothIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  PaintBrushIcon,
  KeyIcon,
  GlobeAltIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateProfile } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.profile?.bio || '',
    company: user?.profile?.company || '',
    location: user?.profile?.location || ''
  })

  const tabs = [
    { id: 'profile', name: 'Profile & Account', icon: UserIcon },
    { id: 'agents', name: 'AI Agents & Teams', icon: Cog6ToothIcon },
    { id: 'integrations', name: 'Integrations & APIs', icon: GlobeAltIcon },
    { id: 'billing', name: 'Billing & Subscription', icon: CreditCardIcon },
    { id: 'security', name: 'Security & Privacy', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'System Preferences', icon: PaintBrushIcon },
    { id: 'enterprise', name: 'Enterprise Features', icon: BuildingOfficeIcon }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    const result = await updateProfile(profileData)
    if (result.success) {
      toast.success('Profile updated successfully!')
    }
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="input-field"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    className="input-field resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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

                <button type="submit" className="btn-primary">
                  Update Profile
                </button>
              </form>
            </div>
          </div>
        )

      case 'agents':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                AI Agent Configuration
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Developer Agent', status: 'active', description: 'Code generation and debugging' },
                  { name: 'Designer Agent', status: 'active', description: 'UI/UX design assistance' },
                  { name: 'Tester Agent', status: 'inactive', description: 'Automated testing and QA' },
                  { name: 'DevOps Agent', status: 'inactive', description: 'Deployment and infrastructure' }
                ].map((agent, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{agent.description}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        agent.status === 'active' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {agent.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        Configure
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Connected Integrations
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Stripe', status: 'connected', type: 'Payment Processing' },
                  { name: 'SendGrid', status: 'connected', type: 'Email Service' },
                  { name: 'MongoDB Atlas', status: 'connected', type: 'Database' },
                  { name: 'Vercel', status: 'disconnected', type: 'Deployment' }
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{integration.type}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        integration.status === 'connected' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {integration.status}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                        {integration.status === 'connected' ? 'Manage' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Appearance & Interface
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Theme</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {theme === 'dark' ? 'Dark' : 'Light'}
                    </span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Receive email notifications</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Auto-save Projects</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Automatically save project changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Security Settings
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <KeyIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Password</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Last changed 3 months ago
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                    Change Password
                  </button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Add an extra layer of security to your account
                  </p>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Subscription & Billing
              </h3>
              <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 font-bold text-sm">F</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Free Plan</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Perfect for getting started</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">AI Models</span>
                    <span className="text-gray-900 dark:text-white">Unlimited (Free via Puter.js)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Projects</span>
                    <span className="text-gray-900 dark:text-white">Unlimited</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="text-gray-900 dark:text-white">5GB</span>
                  </div>
                </div>
                <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
                  View Pro Features →
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="text-center py-12">
            <Cog6ToothIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This section is under development
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Tabs */}
          <div className="lg:w-80">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card sticky top-24"
            >
              <div className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              {renderTabContent()}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings