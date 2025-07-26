import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  Book, MessageSquare, Mail, Phone, MapPin, ExternalLink,
  Search, FileText, Code, Rocket, Users, Settings,
  HelpCircle, Lightbulb, Star, ArrowRight, CheckCircle,
  Clock, Calendar, Activity, Zap, Shield, Globe
} from 'lucide-react';

// Import content from existing contact page
import ContactPage from './ContactPage';

const DocsPage = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('docs');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract section from URL hash or default to 'docs'
  React.useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['docs', 'contact'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const sections = [
    { id: 'docs', label: 'Documentation', icon: <Book className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact & Support', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const docSections = [
    {
      title: 'Getting Started',
      icon: <Rocket className="w-6 h-6" />,
      items: [
        { title: 'Quick Start Guide', description: 'Get up and running in 5 minutes' },
        { title: 'Installation', description: 'System requirements and setup' },
        { title: 'Your First Project', description: 'Create your first AETHERFLOW project' },
        { title: 'Basic Concepts', description: 'Core concepts and terminology' }
      ]
    },
    {
      title: 'IDE Features',
      icon: <Code className="w-6 h-6" />,
      items: [
        { title: 'Code Editor', description: 'Advanced editing features and shortcuts' },
        { title: 'AI Assistant', description: 'Leverage AI for code generation and optimization' },
        { title: 'Debugging Tools', description: 'Debug your applications effectively' },
        { title: 'Extensions', description: 'Extend functionality with marketplace extensions' }
      ]
    },
    {
      title: 'Collaboration',
      icon: <Users className="w-6 h-6" />,
      items: [
        { title: 'Real-time Editing', description: 'Collaborate with team members in real-time' },
        { title: 'Project Sharing', description: 'Share projects and manage permissions' },
        { title: 'Team Management', description: 'Organize and manage your development team' },
        { title: 'Communication Tools', description: 'Built-in chat and video calling' }
      ]
    },
    {
      title: 'Deployment',
      icon: <Rocket className="w-6 h-6" />,
      items: [
        { title: 'One-click Deploy', description: 'Deploy to multiple cloud providers' },
        { title: 'Environment Management', description: 'Manage development, staging, and production' },
        { title: 'CI/CD Integration', description: 'Automated testing and deployment pipelines' },
        { title: 'Monitoring & Analytics', description: 'Monitor application performance' }
      ]
    }
  ];

  const renderDocsContent = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search */}
      <div className="mb-12">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className={`absolute left-4 top-4 w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className={`w-full pl-12 pr-4 py-4 rounded-xl border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg`}
            />
          </div>
        </div>
      </div>

      {/* Documentation Sections */}
      <div className="space-y-12">
        {docSections.map((section, index) => (
          <div key={index} className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 shadow-lg`}>
            <div className="flex items-center space-x-3 mb-6">
              <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'}`}>
                {React.cloneElement(section.icon, { 
                  className: `w-6 h-6 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}` 
                })}
              </div>
              <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {section.title}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {section.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600 hover:bg-gray-650' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'} transition-colors cursor-pointer group`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2 group-hover:text-blue-600 transition-colors`}>
                        {item.title}
                      </h3>
                      <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                        {item.description}
                      </p>
                    </div>
                    <ArrowRight className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'} group-hover:text-blue-600 transition-colors ml-4`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className={`mt-16 p-8 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50' : 'bg-gradient-to-r from-blue-50 to-purple-50'} rounded-xl`}>
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6 text-center`}>
          Need More Help?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} mb-4`}>
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Community Support
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
              Join our Discord community for peer support
            </p>
            <button className={`text-blue-600 hover:text-blue-500 font-medium text-sm`}>
              Join Discord →
            </button>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-green-600' : 'bg-green-500'} mb-4`}>
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Email Support
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
              Get help directly from our support team
            </p>
            <button 
              onClick={() => setActiveSection('contact')}
              className={`text-blue-600 hover:text-blue-500 font-medium text-sm`}
            >
              Contact Us →
            </button>
          </div>

          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${theme === 'dark' ? 'bg-purple-600' : 'bg-purple-500'} mb-4`}>
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
              Feature Requests
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm mb-4`}>
              Request new features or improvements
            </p>
            <button className={`text-blue-600 hover:text-blue-500 font-medium text-sm`}>
              Submit Idea →
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'docs':
        return renderDocsContent();
      case 'contact':
        return <ContactPage embedded={true} />;
      default:
        return renderDocsContent();
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ProfessionalHeader />
      
      {/* Docs Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} mb-4`}>
              <Book className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Documentation & Support
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Everything you need to master AETHERFLOW and get help when you need it
            </p>
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
  );
};

export default DocsPage;