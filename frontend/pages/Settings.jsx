import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  UserIcon,
  SparklesIcon,
  LinkIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon,
  BellIcon,
  EyeIcon,
  MoonIcon,
  SunIcon,
  GlobeAltIcon,
  KeyIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateProfile } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    company: user?.company || '',
    location: user?.location || '',
    website: user?.website || ''
  })

  const tabs = [
    { id: 'profile', name: 'Profile & Account', icon: UserIcon },
    { id: 'agents', name: 'AI Agents & Teams', icon: SparklesIcon },
    { id: 'integrations', name: 'Integrations & APIs', icon: LinkIcon },
    { id: 'billing', name: 'Billing & Subscription', icon: CreditCardIcon },
    { id: 'security', name: 'Security & Privacy', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'System Preferences', icon: Cog6ToothIcon },
    { id: 'enterprise', name: 'Enterprise Features', icon: BuildingOfficeIcon }
  ]

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Information
        </h3>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  const renderAgentsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          AI Agent Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { name: 'Developer Agent', status: 'active', tasks: 'Code generation, debugging, optimization' },
            { name: 'Designer Agent', status: 'available', tasks: 'UI/UX design, component styling' },
            { name: 'Tester Agent', status: 'active', tasks: 'Test creation, quality assurance' },
            { name: 'Integrator Agent', status: 'available', tasks: 'API integration, third-party services' }
          ].map((agent) => (
            <div key={agent.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{agent.name}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  agent.status === 'active' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                }`}>
                  {agent.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{agent.tasks}</p>
              <button className="btn-secondary text-sm">Configure</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Connected Integrations
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Stripe', status: 'connected', type: 'Payment Processing', lastUsed: '2024-01-15' },
            { name: 'MongoDB Atlas', status: 'connected', type: 'Database', lastUsed: '2024-01-15' },
            { name: 'Puter.js AI', status: 'connected', type: 'AI Service', lastUsed: '2024-01-15' },
            { name: 'SendGrid', status: 'available', type: 'Email Service', lastUsed: null }
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  integration.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{integration.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{integration.type}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {integration.lastUsed && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Last used: {integration.lastUsed}
                  </span>
                )}
                <button className="btn-secondary text-sm">
                  {integration.status === 'connected' ? 'Configure' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderBillingTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Current Plan
        </h3>
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white">Free Plan</h4>
              <p className="text-gray-600 dark:text-gray-400">Perfect for getting started</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">$0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">per month</div>
            </div>
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Up to 5 projects</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Basic AI assistance</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Community support</span>
            </div>
          </div>
          <button className="btn-primary">Upgrade Plan</button>
        </div>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Security Settings
        </h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security</p>
              </div>
              <button className="btn-secondary text-sm">Enable</button>
            </div>
          </div>
          
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">API Keys</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your API access keys</p>
              </div>
              <button className="btn-secondary text-sm flex items-center space-x-2">
                <KeyIcon className="w-4 h-4" />
                <span>Manage Keys</span>
              </button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Active Sessions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage active sessions</p>
              </div>
              <button className="btn-secondary text-sm">View Sessions</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          System Preferences
        </h3>
        <div className="space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <MoonIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <SunIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Theme</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred theme</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BellIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage notification preferences</p>
                </div>
              </div>
              <button className="btn-secondary text-sm">Configure</button>
            </div>
          </div>

          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Language & Region</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Set your language and region</p>
                </div>
              </div>
              <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option>English (US)</option>
                <option>English (UK)</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEnterpriseTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Enterprise Features
        </h3>
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
          <BuildingOfficeIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Enterprise Features Available
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Unlock advanced features for teams and organizations including SSO, advanced security, 
            custom integrations, and priority support.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">Team Management</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage team members, roles, and permissions</p>
            </div>
            <div className="text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">Advanced Security</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">SSO, audit logs, and compliance features</p>
            </div>
            <div className="text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">Custom Integrations</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">Build and deploy custom integrations</p>
            </div>
            <div className="text-left p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h5 className="font-medium text-gray-900 dark:text-white mb-1">Priority Support</h5>
              <p className="text-sm text-gray-600 dark:text-gray-400">24/7 dedicated support for your team</p>
            </div>
          </div>
          <button className="btn-primary">Contact Sales</button>
        </div>
      </div>
    </div>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileTab()
      case 'agents': return renderAgentsTab()
      case 'integrations': return renderIntegrationsTab()
      case 'billing': return renderBillingTab()
      case 'security': return renderSecurityTab()
      case 'preferences': return renderPreferencesTab()
      case 'enterprise': return renderEnterpriseTab()
      default: return renderProfileTab()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Cog6ToothIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Settings
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Customize your AI Tempo experience, manage integrations, and configure your development environment.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-80 flex-shrink-0"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 sticky top-8">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-8">
              {renderTabContent()}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings