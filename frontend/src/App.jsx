import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Import pages
import Dashboard from './pages/Dashboard'

// Import components (we'll create these if needed)
const HomePage = () => <div className="p-8">Home Page - Coming Soon</div>
const LoginPage = () => <div className="p-8">Login Page - Coming Soon</div>
const SignupPage = () => <div className="p-8">Signup Page - Coming Soon</div>
const TemplatesPage = () => <div className="p-8">Templates Page - Coming Soon</div>
const ChatHubPage = () => <div className="p-8">Chat Hub - Coming Soon</div>
const ChatProjectPage = () => <div className="p-8">Chat Project - Coming Soon</div>
const IntegrationsPage = () => <div className="p-8">Integrations Page - Coming Soon</div>
const SettingsPage = () => <div className="p-8">Settings Page - Coming Soon</div>
const ProfilePage = () => <div className="p-8">Profile Page - Coming Soon</div>

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <ChatHubPage />
            </ProtectedRoute>
          } />
          <Route path="/chat/:projectId" element={
            <ProtectedRoute>
              <ChatProjectPage />
            </ProtectedRoute>
          } />
          <Route path="/integrations" element={
            <ProtectedRoute>
              <IntegrationsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Redirect to dashboard for authenticated users, login for others */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App