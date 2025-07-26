import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  ArrowRight, CheckCircle, Star, Users, Code2, Rocket, Shield, 
  Infinity, Sparkles, TrendingUp, Award, Globe, Database, Cpu,
  Layers, Activity, BarChart3, Zap, Heart, Building2, Mail,
  Phone, MapPin, MessageSquare, ExternalLink, ChevronDown,
  AlertTriangle, Clock, Server, Wifi, RefreshCw
} from 'lucide-react';

// Import content from existing pages
import AboutPage from './AboutPage';
import PricingPage from './PricingPage';
import EnterprisePage from './EnterprisePage';
import ApiStatusPage from './ApiStatusPage';

const PlatformPage = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('about');

  // Extract section from URL hash or default to 'about'
  React.useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['about', 'pricing', 'enterprise', 'status'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const sections = [
    { id: 'about', label: 'About', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'pricing', label: 'Pricing', icon: <Zap className="w-4 h-4" /> },
    { id: 'enterprise', label: 'Enterprise', icon: <Building2 className="w-4 h-4" /> },
    { id: 'status', label: 'API Status', icon: <Activity className="w-4 h-4" /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return <AboutPage embedded={true} />;
      case 'pricing':
        return <PricingPage embedded={true} />;
      case 'enterprise':
        return <EnterprisePage embedded={true} />;
      case 'status':
        return <ApiStatusPage embedded={true} />;
      default:
        return <AboutPage embedded={true} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ProfessionalHeader />
      
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
  );
};

export default PlatformPage;