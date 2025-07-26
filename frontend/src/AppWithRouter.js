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
                {/* 🚀 CONSOLIDATED HYBRID PLATFORM ROUTES */}
                
                {/* Landing Page */}
                <Route path="/" element={<EnhancedLandingPage />} />
                
                {/* Unified App Workspace - Combines Dashboard + IDE + Projects + Analytics */}
                <Route 
                  path="/app" 
                  element={
                    <PrivateRoute>
                      <UnifiedAppPage />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/app/:view" 
                  element={
                    <PrivateRoute>
                      <UnifiedAppPage />
                    </PrivateRoute>
                  } 
                />
                
                {/* Platform Information - About + Pricing + Enterprise + API Status */}
                <Route path="/platform" element={<PlatformPage />} />
                
                {/* Account Management - Profile + Billing + Team + Integrations */}
                <Route 
                  path="/account" 
                  element={
                    <PrivateRoute>
                      <AccountPage />
                    </PrivateRoute>
                  } 
                />
                
                {/* Authentication - Sign In + Sign Up */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/auth/:mode" element={<AuthPage />} />
                
                {/* Legal - Terms + Privacy */}
                <Route path="/legal" element={<LegalPage />} />
                
                {/* Documentation & Support - Docs + Contact */}
                <Route path="/docs" element={<DocsPage />} />
                
                {/* 🔄 BACKWARD COMPATIBILITY ROUTES (Redirects) */}
                <Route path="/signin" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth/signup" replace />} />
                <Route path="/dashboard" element={<Navigate to="/app" replace />} />
                <Route path="/ide" element={<Navigate to="/app#ide" replace />} />
                <Route path="/profile" element={<Navigate to="/account#profile" replace />} />
                <Route path="/billing" element={<Navigate to="/account#billing" replace />} />
                <Route path="/team" element={<Navigate to="/account#team" replace />} />
                <Route path="/integrations" element={<Navigate to="/account#integrations" replace />} />
                <Route path="/about" element={<Navigate to="/platform#about" replace />} />
                <Route path="/pricing" element={<Navigate to="/platform#pricing" replace />} />
                <Route path="/enterprise" element={<Navigate to="/platform#enterprise" replace />} />
                <Route path="/api-status" element={<Navigate to="/platform#status" replace />} />
                <Route path="/terms" element={<Navigate to="/legal#terms" replace />} />
                <Route path="/privacy" element={<Navigate to="/legal#privacy" replace />} />
                <Route path="/contact" element={<Navigate to="/docs#contact" replace />} />

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