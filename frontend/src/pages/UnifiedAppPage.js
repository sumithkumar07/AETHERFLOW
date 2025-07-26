import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import PrivateRoute from '../components/PrivateRoute';

// Import the main IDE app and dashboard content
import IDEApp from '../App';
import EnhancedDashboardPage from './EnhancedDashboardPage';

import {
  LayoutDashboard, Code, Users, Settings, Activity,
  FolderOpen, Terminal, GitBranch, Package, BarChart3,
  Rocket, Zap, Star, Plus, Home, Layers, Grid3X3
} from 'lucide-react';

const UnifiedAppPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Extract view from URL hash or path
  useEffect(() => {
    const path = location.pathname;
    const hash = location.hash.replace('#', '');
    
    if (path.includes('/app/ide') || hash === 'ide') {
      setActiveView('ide');
    } else if (path.includes('/app/projects') || hash === 'projects') {
      setActiveView('projects');
    } else if (path.includes('/app/analytics') || hash === 'analytics') {
      setActiveView('analytics');
    } else {
      setActiveView('dashboard');
    }
  }, [location]);

  const views = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'Overview and quick actions'
    },
    {
      id: 'ide',
      label: 'IDE',
      icon: <Code className="w-5 h-5" />,
      description: 'Full development environment'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: <FolderOpen className="w-5 h-5" />,
      description: 'Manage your projects'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Performance insights'
    }
  ];

  const handleViewChange = (viewId) => {
    setActiveView(viewId);
    // Update URL without causing full navigation
    window.history.pushState({}, '', `/app#${viewId}`);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <EnhancedDashboardPage embedded={true} />;
      case 'ide':
        return (
          <div className="h-full">
            <IDEApp />
          </div>
        );
      case 'projects':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-8`}>
                Project Management
              </h1>
              <div className="grid gap-6">
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Recent Projects
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your project management interface will be displayed here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-8">
            <div className="max-w-6xl mx-auto">
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-8`}>
                Analytics Dashboard
              </h1>
              <div className="grid gap-6">
                <div className={`p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Performance Metrics
                  </h2>
                  <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your analytics and performance insights will be displayed here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <EnhancedDashboardPage embedded={true} />;
    }
  };

  return (
    <PrivateRoute>
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col`}>
        {/* Only show header for non-IDE views */}
        {activeView !== 'ide' && <ProfessionalHeader />}
        
        <div className="flex flex-1">
          {/* Sidebar - Only show for non-IDE views */}
          {activeView !== 'ide' && (
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border-r ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} transition-all duration-300 flex-shrink-0`}>
              <div className="p-4">
                {/* Collapse Toggle */}
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className={`w-full flex items-center justify-center p-2 rounded-lg ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors mb-4`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>

                {/* Navigation */}
                <nav className="space-y-2">
                  {views.map((view) => (
                    <button
                      key={view.id}
                      onClick={() => handleViewChange(view.id)}
                      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        activeView === view.id
                          ? `${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'}`
                          : `${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                      }`}
                    >
                      <span className="flex-shrink-0">
                        {view.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <div className="ml-3 flex-1">
                          <div className="font-medium">
                            {view.label}
                          </div>
                          <div className={`text-xs ${activeView === view.id ? 'text-current opacity-75' : 'text-gray-500'}`}>
                            {view.description}
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </nav>

                {/* Quick Actions */}
                {!sidebarCollapsed && (
                  <div className="mt-8 pt-4 border-t border-gray-700">
                    <h3 className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wider mb-3`}>
                      Quick Actions
                    </h3>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleViewChange('ide')}
                        className={`w-full flex items-center p-2 rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} text-sm transition-colors`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Project
                      </button>
                      <button className={`w-full flex items-center p-2 rounded-lg ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'} text-sm transition-colors`}>
                        <GitBranch className="w-4 h-4 mr-2" />
                        Import Repo
                      </button>
                    </div>
                  </div>
                )}

                {/* User Stats */}
                {!sidebarCollapsed && (
                  <div className="mt-8 pt-4 border-t border-gray-700">
                    <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          VIBE Tokens
                        </span>
                        <Star className="w-4 h-4 text-yellow-500" />
                      </div>
                      <div className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        1,000
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Professional Level
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </PrivateRoute>
  );
};

export default UnifiedAppPage;