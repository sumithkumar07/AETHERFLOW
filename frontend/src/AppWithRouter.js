import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import NotificationProvider from './components/NotificationSystem';
import PrivateRoute from './components/PrivateRoute';

// Import consolidated pages
import EnhancedLandingPage from './pages/EnhancedLandingPage';
import UnifiedAppPage from './pages/UnifiedAppPage';
import PlatformPage from './pages/PlatformPage';
import AccountPage from './pages/AccountPage';
import AuthPage from './pages/AuthPage';
import LegalPage from './pages/LegalPage';
import DocsPage from './pages/DocsPage';

// Legacy imports for embedded components (kept for backward compatibility)
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import ContactPage from './pages/ContactPage';
import EnhancedDashboardPage from './pages/EnhancedDashboardPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ApiStatusPage from './pages/ApiStatusPage';
import TeamPage from './pages/TeamPage';
import BillingPage from './pages/BillingPage';
import EnterprisePage from './pages/EnterprisePage';

// Import the existing IDE App component
import IDEApp from './App';

// Import theme styles
import './styles/themes.css';

function AppWithRouter() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<EnhancedLandingPage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/docs" element={<DocsPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/api-status" element={<ApiStatusPage />} />
                <Route path="/enterprise" element={<EnterprisePage />} />

                {/* Private routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <EnhancedDashboardPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <ProfilePage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/team" 
                  element={
                    <PrivateRoute>
                      <TeamPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/billing" 
                  element={
                    <PrivateRoute>
                      <BillingPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/ide" 
                  element={
                    <PrivateRoute>
                      <IDEApp />
                    </PrivateRoute>
                  } 
                />
                
                {/* Redirect old app route to dashboard for authenticated users */}
                <Route 
                  path="/app" 
                  element={<Navigate to="/dashboard" replace />} 
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default AppWithRouter;