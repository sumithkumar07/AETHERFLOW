import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import PrivateRoute from '../components/PrivateRoute';
import {
  User, CreditCard, Users, Package, Settings, Shield,
  Bell, Key, Globe, Smartphone, Mail, Calendar,
  Activity, BarChart3, Download, Upload, ExternalLink
} from 'lucide-react';

// Import content from existing pages
import ProfilePage from './ProfilePage';
import BillingPage from './BillingPage';
import TeamPage from './TeamPage';
import IntegrationsPage from './IntegrationsPage';

const AccountPage = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profile');

  // Extract section from URL hash or default to 'profile'
  React.useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['profile', 'billing', 'team', 'integrations'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const sections = [
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'team', label: 'Team', icon: <Users className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Package className="w-4 h-4" /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfilePage embedded={true} />;
      case 'billing':
        return <BillingPage embedded={true} />;
      case 'team':
        return <TeamPage embedded={true} />;
      case 'integrations':
        return <IntegrationsPage embedded={true} />;
      default:
        return <ProfilePage embedded={true} />;
    }
  };

  return (
    <PrivateRoute>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <ProfessionalHeader />
        
        {/* Account Header */}
        <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center`}>
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Account Settings
                </h1>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Manage your account, billing, team, and integrations
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`sticky top-16 z-40 ${theme === 'dark' ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeSection === section.id
                      ? `border-blue-500 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`
                      : `border-transparent ${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
                  }`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </PrivateRoute>
  );
};

export default AccountPage;