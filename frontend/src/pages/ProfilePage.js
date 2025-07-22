import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Zap, User, Mail, Calendar, Star, Award, Settings, 
  Camera, Edit, Save, X, Bell, Shield, CreditCard, 
  LogOut, Trash2, Eye, EyeOff, CheckCircle, AlertCircle,
  Users, Code, Sparkles, TrendingUp
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    company: user?.company || '',
    website: user?.website || '',
    location: user?.location || ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    marketing: false,
    security: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const stats = {
    projects: 12,
    collaborations: 5,
    vibeTokens: user?.credits || 1000,
    achievements: 23,
    universes: 3,
    aiSessions: 156
  };

  const achievements = [
    {
      icon: <Code className="w-6 h-6" />,
      title: 'First Cosmic Project',
      description: 'Created your first project in AETHERFLOW',
      date: 'Jan 15, 2025',
      rarity: 'common'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Reality Shifter',
      description: 'Successfully debugged across 3 parallel universes',
      date: 'Jan 20, 2025', 
      rarity: 'rare'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Cosmic Collaborator',
      description: 'Participated in 5 collaborative projects',
      date: 'Jan 25, 2025',
      rarity: 'epic'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'VIBE Master',
      description: 'Earned 10,000 VIBE tokens',
      date: 'Jan 30, 2025',
      rarity: 'legendary'
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'text-gray-400 bg-gray-400/10',
      rare: 'text-blue-400 bg-blue-400/10', 
      epic: 'text-purple-400 bg-purple-400/10',
      legendary: 'text-yellow-400 bg-yellow-400/10'
    };
    return colors[rarity] || colors.common;
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Award className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/90 backdrop-blur-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <Zap className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AETHERFLOW
                </span>
              </Link>
              <div className="hidden md:block text-gray-400">|</div>
              <h1 className="hidden md:block text-xl font-semibold">Profile Settings</h1>
            </div>

            <Link to="/dashboard" className="btn btn-ghost">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6 text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-2xl font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <button className="absolute bottom-0 right-1/2 translate-x-12 translate-y-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="text-xl font-bold mb-1">{user?.name || 'Cosmic Developer'}</h2>
              <p className="text-purple-400 mb-2">{user?.plan || 'Professional'} Plan</p>
              <p className="text-gray-400 text-sm mb-4">{user?.email}</p>
              
              <div className="flex justify-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-blue-400">{stats.projects}</div>
                  <div className="text-gray-400">Projects</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-400">{stats.collaborations}</div>
                  <div className="text-gray-400">Teams</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-400">{stats.vibeTokens}</div>
                  <div className="text-gray-400">VIBE</div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-slate-800/50 rounded-xl border border-slate-600 p-6">
              <h3 className="font-semibold mb-4">Cosmic Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Universes Accessed</span>
                  <span className="font-semibold">{stats.universes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">AI Sessions</span>
                  <span className="font-semibold">{stats.aiSessions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Achievements</span>
                  <span className="font-semibold">{stats.achievements}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Join Date</span>
                  <span className="font-semibold">Jan 2025</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-600 mb-6">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                        : 'border-transparent text-gray-400 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-600 p-6">
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Profile Information</h3>
                    {!isEditing ? (
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="btn btn-secondary"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button 
                          onClick={handleSave}
                          disabled={saving}
                          className="btn btn-primary"
                        >
                          {saving ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </button>
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="btn btn-ghost"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field disabled:opacity-60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="input-field disabled:opacity-60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your company"
                        className="input-field disabled:opacity-60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your location"
                        className="input-field disabled:opacity-60"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="https://your-website.com"
                        className="input-field disabled:opacity-60"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        rows={3}
                        placeholder="Tell us about your cosmic development journey..."
                        className="input-field resize-none disabled:opacity-60"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Security Settings</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-3">Change Password</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className="input-field pr-10"
                              placeholder="Enter current password"
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                          <input
                            type="password"
                            className="input-field"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>
                      <button className="mt-4 btn btn-primary">Update Password</button>
                    </div>

                    <div className="border-t border-slate-600 pt-6">
                      <h4 className="font-semibold mb-3">Two-Factor Authentication</h4>
                      <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div>
                          <h5 className="font-medium">Authenticator App</h5>
                          <p className="text-sm text-gray-400">Use an authenticator app for additional security</p>
                        </div>
                        <button className="btn btn-secondary">Enable</button>
                      </div>
                    </div>

                    <div className="border-t border-slate-600 pt-6">
                      <h4 className="font-semibold mb-3">Active Sessions</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                          <div>
                            <h5 className="font-medium">Chrome on MacOS</h5>
                            <p className="text-sm text-gray-400">San Francisco, CA • Current session</p>
                          </div>
                          <span className="text-green-400 text-sm">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Notification Settings</h3>
                  
                  <div className="space-y-4">
                    {Object.entries(notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                        <div>
                          <h4 className="font-medium capitalize">{key} Notifications</h4>
                          <p className="text-sm text-gray-400">
                            {key === 'email' && 'Receive notifications via email'}
                            {key === 'push' && 'Receive browser push notifications'}
                            {key === 'marketing' && 'Receive updates about new features'}
                            {key === 'security' && 'Receive security alerts and updates'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value}
                            onChange={() => handleNotificationChange(key)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'billing' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Billing & Subscription</h3>
                  
                  <div className="space-y-6">
                    <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-purple-300">Professional Plan</h4>
                          <p className="text-sm text-gray-400">$29/month • Next billing: Feb 1, 2025</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">$29.00</div>
                          <button className="text-sm text-purple-400 hover:text-purple-300">Change plan</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Payment Method</h4>
                      <div className="p-4 bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-sm text-gray-400">Expires 12/26</p>
                            </div>
                          </div>
                          <button className="btn btn-ghost btn-sm">Update</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Billing History</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium">Professional Plan</p>
                            <p className="text-sm text-gray-400">Jan 1, 2025</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">$29.00</p>
                            <a href="#" className="text-sm text-blue-400">Download</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div>
                  <h3 className="text-xl font-semibold mb-6">Cosmic Achievements</h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="achievement-card">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getRarityColor(achievement.rarity).split(' ')[1]}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold">{achievement.title}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full ${getRarityColor(achievement.rarity)}`}>
                                {achievement.rarity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                            <p className="text-xs text-gray-500">{achievement.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="mt-6 bg-red-500/5 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                  </div>
                  <button className="btn bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/20">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;