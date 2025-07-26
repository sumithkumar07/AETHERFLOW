import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import ProfessionalHeader from '../components/ProfessionalHeader';
import {
  Shield, FileText, Scale, Eye, Lock, Users,
  Calendar, Mail, Phone, MapPin, ExternalLink
} from 'lucide-react';

// Import content from existing pages
import TermsPage from './TermsPage';
import PrivacyPage from './PrivacyPage';

const LegalPage = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState('terms');

  // Extract section from URL hash or default to 'terms'
  React.useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (['terms', 'privacy'].includes(hash)) {
      setActiveSection(hash);
    }
  }, [location.hash]);

  const sections = [
    { id: 'terms', label: 'Terms of Service', icon: <FileText className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield className="w-4 h-4" /> }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'terms':
        return <TermsPage embedded={true} />;
      case 'privacy':
        return <PrivacyPage embedded={true} />;
      default:
        return <TermsPage embedded={true} />;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ProfessionalHeader />
      
      {/* Legal Header */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'} mb-4`}>
              <Scale className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Legal Information
            </h1>
            <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Our commitment to transparency, privacy, and responsible use of our platform
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

      {/* Contact Information */}
      <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} mt-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-4`}>
              Questions About Our Legal Policies?
            </h3>
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              If you have any questions about our terms of service or privacy policy, 
              please don't hesitate to contact our legal team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <Mail className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} mx-auto mb-4`} />
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                Email Us
              </h4>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                legal@aetherflow.dev
              </p>
            </div>

            <div className="text-center">
              <FileText className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} mx-auto mb-4`} />
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                Legal Documents
              </h4>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Updated regularly for compliance
              </p>
            </div>

            <div className="text-center">
              <Calendar className={`w-8 h-8 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'} mx-auto mb-4`} />
              <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                Last Updated
              </h4>
              <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                January 2025
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/docs#contact"
              className={`inline-flex items-center space-x-2 ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} font-medium`}
            >
              <span>Contact Support</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;