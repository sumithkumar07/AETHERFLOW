import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Debug log
  console.log('PrivateRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);
  
  // Check localStorage directly as fallback
  const storedAuth = localStorage.getItem('aetherflow_auth');
  const storedUser = localStorage.getItem('aetherflow_user');
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-white mt-4">Loading your cosmic reality...</p>
        </div>
      </div>
    );
  }

  // Check both context state and localStorage
  if (!isAuthenticated && (!storedAuth || storedAuth !== 'true' || !storedUser)) {
    console.log('PrivateRoute - Redirecting to signin');
    // Redirect to sign-in page with return url
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;