import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import { 
  Bell, 
  Settings, 
  Users, 
  CreditCard, 
  Shield, 
  BarChart3,
  ChevronDown,
  Building,
  Zap
} from 'lucide-react';

const ProfessionalHeader = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/profile') return 'Profile';
    if (path === '/ide') return 'IDE';
    if (path === '/integrations') return 'Integrations';
    if (path === '/api-status') return 'API Status';
    if (path === '/billing') return 'Billing';
    if (path === '/team') return 'Team Management';
    if (path === '/enterprise') return 'Enterprise';
    return 'AETHERFLOW';
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/ide', label: 'IDE', icon: Zap },
    { path: '/integrations', label: 'Integrations', icon: Settings },
    { path: '/team', label: 'Team', icon: Users },
    { path: '/billing', label: 'Billing', icon: CreditCard },
    { path: '/enterprise', label: 'Enterprise', icon: Building }
  ];

  if (!isAuthenticated) {
    return (
      <header className="professional-header">
        <div className="header-content">
          <Link to="/" className="logo">
            <Zap className="w-6 h-6" />
            AETHERFLOW
          </Link>
          <nav className="header-nav">
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/pricing" className="nav-link">Pricing</Link>
            <Link to="/docs" className="nav-link">Docs</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <ThemeToggle />
            <Link to="/signin" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="professional-header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            <Zap className="w-6 h-6" />
            AETHERFLOW
          </Link>
          <div className="breadcrumb">
            <span className="breadcrumb-separator">|</span>
            <span>{getPageTitle()}</span>
          </div>
        </div>

        <nav className="header-navigation">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="header-right">
          <div className="collaboration-status">
            <Users className="w-4 h-4" />
            <span className="status-text">5 Online</span>
          </div>

          <div className="notifications">
            <button className="notification-btn">
              <Bell className="w-5 h-5" />
              <span className="notification-count">3</span>
            </button>
          </div>

          <ThemeToggle />

          <div className="user-menu">
            <button className="user-menu-trigger">
              <div className="user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name}</span>
                <span className="user-plan">{user?.plan}</span>
              </div>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfessionalHeader;